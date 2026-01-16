<template>
  <div v-if="state.dialogVisible" class="login-dialog-overlay">
    <div class="login-dialog">
      <div class="login-dialog-header">
        <h3>로그인</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      <form @submit.prevent="clickLogin" ref="loginForm">
        <div class="form-group">
          <label for="id">아이디</label>
          <input type="text" id="id" v-model="state.form.id" autocomplete="off" />
          <span v-if="errors.id" class="error">{{ errors.id }}</span>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="state.form.password" autocomplete="off" />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <div class="dialog-footer">
          <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
.login-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-dialog {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}
.login-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: calc(100% - 20px);
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.error {
  color: red;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}
.dialog-footer {
  text-align: center;
}
.btn-primary {
  background-color: #409eff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'LoginDialog',

  props: {
    open: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const store = useStore()
    const loginForm = ref(null)

    const state = reactive({
      form: {
        id: '',
        password: ''
      },
      dialogVisible: props.open
    })

    const errors = reactive({
      id: '',
      password: ''
    })

    watch(() => props.open, (newVal) => {
      state.dialogVisible = newVal
      if (newVal) {
        // 팝업이 열릴 때 폼 초기화
        state.form.id = ''
        state.form.password = ''
        errors.id = ''
        errors.password = ''
      }
    })

    // 실시간 유효성 검사
    watch(() => state.form.id, (newVal) => {
      validateId(newVal)
    })

    watch(() => state.form.password, (newVal) => {
      validatePassword(newVal)
    })

    const validateId = (id) => {
      if (!id) {
        errors.id = '필수 입력 항목입니다.'
        return false
      } else if (id.length > 16) {
        errors.id = '최대 16자까지 입력 가능합니다.'
        return false
      } else {
        errors.id = ''
        return true
      }
    }

    const validatePassword = (password) => {
      if (!password) {
        errors.password = '필수 입력 항목입니다.'
        return false
      } else if (password.length < 9) {
        errors.password = '최소 9글자를 입력해야 합니다.'
        return false
      } else if (password.length > 16) {
        errors.password = '최대 16글자까지 입력 가능합니다.'
        return false
      } else {
        // 영문 + 숫자 + 특수문자 조합 체크
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        
        if (!hasLetter || !hasNumber || !hasSpecial) {
          errors.password = '비밀번호는 영문, 숫자, 특수문자가 조합되어야 합니다.'
          return false
        } else {
          errors.password = ''
          return true
        }
      }
    }

    const validate = () => {
      const idValid = validateId(state.form.id)
      const passwordValid = validatePassword(state.form.password)
      return idValid && passwordValid
    }

    const loading = ref(false)

    const clickLogin = async () => {
      if (!validate()) {
        return
      }
      
      loading.value = true
      try {
        await store.dispatch('accountStore/loginAction', { id: state.form.id, password: state.form.password })
        handleClose()
      } catch (error) {
        // 에러는 인터셉터에서 처리됨
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleClose = () => {
      state.form.id = ''
      state.form.password = ''
      emit('closeLoginDialog')
    }

    const isFormValid = computed(() => {
      return state.form.id && 
             state.form.id.length <= 16 && 
             state.form.password && 
             state.form.password.length >= 9 && 
             state.form.password.length <= 16 &&
             /[a-zA-Z]/.test(state.form.password) &&
             /[0-9]/.test(state.form.password) &&
             /[!@#$%^&*(),.?":{}|<>]/.test(state.form.password) &&
             !errors.id && 
             !errors.password
    })

    return { state, errors, loginForm, clickLogin, handleClose, loading, isFormValid }
  }
}
</script>
