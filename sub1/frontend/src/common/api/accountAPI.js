import $axios from "axios";

/**
 * 로그인 요청을 수행하는 api 호출 함수
 *
 * @param { object } payload 로그인 정보 - { id: stirng, password: string }
 * @returns Promise
 */
const requestLogin = payload => $axios.post("/auth/login", payload);

/**
 * 회원가입 요청을 수행하는 api 호출 함수
 * 
 * @param { object } payload 회원가입 정보
 * @returns Promise
 */
const requestSignup = payload => $axios.post("/users", payload);

/**
 * 아이디 중복 확인 api 호출 함수
 * 
 * @param { string } userId
 * @returns Promise
 */
const requestCheckDuplicateId = userId => $axios.get(`/users/${userId}`);

export { requestLogin, requestSignup, requestCheckDuplicateId };
