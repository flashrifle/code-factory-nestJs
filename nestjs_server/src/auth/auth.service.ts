import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
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
}
