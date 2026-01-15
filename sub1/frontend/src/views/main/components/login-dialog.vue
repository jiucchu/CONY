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
          <input 
            type="text" 
            id="id" 
            v-model="state.form.id" 
            @input="validateId"
            maxlength="16"
            autocomplete="off" 
          />
          <span v-if="errors.id" class="error">{{ errors.id }}</span>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            v-model="state.form.password" 
            @input="validatePassword"
            maxlength="16"
            autocomplete="off" 
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <div class="dialog-footer">
          <button type="submit" class="btn-primary" :disabled="!isFormValid">로그인</button>
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
  z-index: 1000;
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
.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

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
        state.form.id = ''
        state.form.password = ''
        errors.id = ''
        errors.password = ''
      }
    })

    const validateId = () => {
      if (!state.form.id) {
        errors.id = '아이디를 입력해주세요.'
      } else {
        errors.id = ''
      }
    }

    const validatePassword = () => {
      const pw = state.form.password
      // PRD: 영문+숫자+특수문자 조합, 9~16자
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{9,16}$/
      if (!regex.test(pw)) {
        errors.password = '영문+숫자+특수문자 조합, 9~16자로 입력해주세요.'
      } else {
        errors.password = ''
      }
    }

    const isFormValid = computed(() => {
      return state.form.id && !errors.id && state.form.password && !errors.password
    })

    const clickLogin = async () => {
      if (isFormValid.value) {
        try {
          await store.dispatch('accountStore/loginAction', { id: state.form.id, password: state.form.password })
          handleClose()
        } catch (err) {
            // Error handling is done in axios interceptor (if 401/403) or generic catch
            // But interceptor throws error, so we catch here to stop spinner or show extra msg?
            // Actually axios interceptor alerts.
        }
      }
    }

    const handleClose = () => {
      emit('closeLoginDialog')
    }

    return { state, errors, loginForm, clickLogin, handleClose, validateId, validatePassword, isFormValid }
  }
}
</script>
