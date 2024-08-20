import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /*
    토큰을 사용하게 되는 방식
    1. 사용자가 로그인 또는 회원가입을 진행하면
       AT, RT 를 발급받게 된다.
    2. 로그인 할 때는 Basic토큰과 함께 요청을 보낸다
       Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다.
       ex {authorization: 'Basic {token}'}
    3. 아무나 접근할 수 없는 정보를 접근할 때는
       AT를 헤더에 추가해서 요청과 함께 보낸다
       ex {authorization: 'Bearer {token}'}
    4. 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해
       현재 요청을 보낸 사용자가 누구인지 알 수 있다.
    5. 모든 토큰은 만료기간이 있다. 만료기간이 지나면 새로 토큰을 받아야한다.
       그렇지 않으면 jwtService.verify()에서 통과가 안됨
       그러니 access 토큰을 새로 발급 받을 수 있는 /auth/token/access 와
       refresh 토큰을 새로 발급 받을 수 있는 /auth/token/refresh 가 필요하다.
   */

  /*
    Header 로 부터 토큰을 받을 때
    {authorization: 'Basic {token}'}
    {authorization: 'Bearer {token}'}
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰 입니다.');
    }
    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64string: string) {
    const decoded = Buffer.from(base64string, 'base64').toString('utf8');
    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return { email, password };
  }

  // 토큰 검증
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰 입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /*
    sub: id
    email: email,
    type : ~
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다!');
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

  /*
        1. registerWithEmail
            - email, nickname, password 를 입력받고 사용자 생성
            - 생성이 완료되면 AT, RT 를 반환
              회원가입 후 다시 로그인해주세요 <- 쓸데없는 과정 방지

        2. loginWithEmail
            - email, password 를 입력하면 사용자 검증을 진행
            - 검증이 완료되면 AT, RT 반환

        3. loginUser
            - 1과 2에서 필요한 AT, RT 를 반환하는 로직

        4. signToken
            - 3에서 필요한 AT, RT 를 sign 하는 로직

        5. authenticateWithEmailAndPassword
            - 2에서 로그인을 진할할 때 필요한 기본적인 검증 진행
            1. 사용자가 존재하는지 확인 (email)
            2. 비밀번호가 맞는지 확인
            3. 모두 통과되면 찾은 사용자 정보 반환
            4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
     */
  /*
    payload 에 들어갈 정보
    1. email
    2. sub -> id
    3. type : 'AT' | 'RT'
     */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
    /*
        1. 사용자가 존재하는지 확인 (email)
        2. 비밀번호가 맞는지 확인
        3. 모두 통과되면 찾은 사용자 정보 반환
     */
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자 입니다.');
    }

    /*
      파라미터
      1. 입력된 비밀번호
      2. 기존 해시 (hash) -> 사용자 정보에 저장되어있는 hash
     */
    const passOK = await bcrypt.compare(user.password, existingUser.password);
    if (!passOK) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
