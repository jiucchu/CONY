import { requestLogin, requestRegister, checkUserId, getUserInfo } from "../common/api/accountAPI";
import { axios } from "../common/lib/axios";

const state = {
  token: null,
  user: null,
  isLoggedIn: false
};

const getters = {
  getToken: state => {
    return state.token;
  },
  getUser: state => {
    return state.user;
  },
  isLoggedIn: state => {
    return state.isLoggedIn;
  }
};

const mutations = {
  setToken: (state, token) => {
    state.token = token;
    // localStorage에도 저장하여 새로고침 후에도 유지
    if (token) {
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.Authorization = 'Bearer ' + token;
    } else {
      localStorage.removeItem('accessToken');
      axios.defaults.headers.Authorization = '';
    }
  },
  setUser: (state, user) => {
    state.user = user;
    state.isLoggedIn = !!user;
  },
  logout: (state) => {
    state.token = null;
    state.user = null;
    state.isLoggedIn = false;
    localStorage.removeItem('accessToken');
    axios.defaults.headers.Authorization = '';
  }
};

const actions = {
  loginAction: async ({ commit, dispatch }, loginData) => {
    const response = await requestLogin(loginData);
    const accessToken = response.data.accessToken;
    commit("setToken", accessToken);
    // 로그인 성공 후 유저 정보 조회
    await dispatch('accountStore/fetchUserInfo');
  },
  fetchUserInfo: async ({ commit, dispatch }) => {
    try {
      const response = await getUserInfo();
      commit("setUser", response.data);
    } catch (error) {
      // 에러 발생 시 로그아웃 처리
      commit("logout");
      throw error;
    }
  },
  registerAction: async ({ commit }, registerData) => {
    const response = await requestRegister(registerData);
    return response;
  },
  checkUserIdAction: async ({ commit }, userId) => {
    const response = await checkUserId(userId);
    return response;
  },
  logoutAction: ({ commit }) => {
    commit("logout");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
