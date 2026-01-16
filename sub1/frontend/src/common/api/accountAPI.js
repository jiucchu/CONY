import { axios } from "../lib/axios";

/**
 * 로그인 요청을 수행하는 api 호출 함수
 *
 * @param { object } payload 로그인 정보 - { id: string, password: string }
 * @returns Promise
 */
const requestLogin = payload => axios.post("/auth/login", payload);

/**
 * 회원가입 요청을 수행하는 api 호출 함수
 *
 * @param { object } payload 회원가입 정보
 * @returns Promise
 */
const requestRegister = payload => axios.post("/users", payload);

/**
 * 아이디 중복 확인 요청을 수행하는 api 호출 함수
 *
 * @param { string } userId 아이디
 * @returns Promise
 */
const checkUserId = userId => axios.get(`/users/check-id/${userId}`);

/**
 * 현재 로그인한 유저 정보 조회
 *
 * @returns Promise
 */
const getUserInfo = () => axios.get("/users/me");

export { requestLogin, requestRegister, checkUserId, getUserInfo };
