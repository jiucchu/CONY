<template>
  <div v-if="state.dialogVisible" class="register-dialog-overlay">
    <div class="register-dialog">
      <div class="register-dialog-header">
        <h3>회원가입</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      <form @submit.prevent="clickRegister" ref="registerForm">
        <div class="form-group">
          <label for="department">소속</label>
          <input type="text" id="department" v-model="state.form.department" autocomplete="off" />
          <span v-if="errors.department" class="error">{{ errors.department }}</span>
        </div>
        <div class="form-group">
          <label for="position">직책</label>
          <input type="text" id="position" v-model="state.form.position" autocomplete="off" />
          <span v-if="errors.position" class="error">{{ errors.position }}</span>
        </div>
        <div class="form-group">
          <label for="name">이름</label>
          <input type="text" id="name" v-model="state.form.name" autocomplete="off" />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label for="id">아이디</label>
          <div class="id-input-wrapper">
            <input type="text" id="id" v-model="state.form.id" autocomplete="off" />
            <button type="button" class="check-btn" @click="checkIdDuplicate" :disabled="!state.form.id || state.form.id.length > 16">
              중복 확인
            </button>
          </div>
          <span v-if="errors.id" class="error">{{ errors.id }}</span>
          <span v-if="idCheckMessage" :class="idCheckMessageClass">{{ idCheckMessage }}</span>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="state.form.password" autocomplete="off" />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <input type="password" id="passwordConfirm" v-model="state.form.passwordConfirm" autocomplete="off" />
          <span v-if="errors.passwordConfirm" class="error">{{ errors.passwordConfirm }}</span>
        </div>
        <div class="dialog-footer">
          <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
            {{ loading ? '가입 중...' : '가입하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
.register-dialog-overlay {
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
.register-dialog {
  background: white;
  padding: 20px;
  width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}
.register-dialog-header {
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
.id-input-wrapper {
  display: flex;
  gap: 10px;
}
.id-input-wrapper input {
  flex: 1;
}
.check-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.check-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.error {
  color: red;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}
.success {
  color: green;
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
  width: 100%;
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
  name: 'RegisterDialog',

  props: {
    open: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const store = useStore()
    const registerForm = ref(null)

    const state = reactive({
      form: {
        department: '',
        position: '',
        name: '',
        id: '',
        password: '',
        passwordConfirm: ''
      },
      dialogVisible: props.open,
      idChecked: false,
      idAvailable: false
    })

    const errors = reactive({
      department: '',
      position: '',
      name: '',
      id: '',
      password: '',
      passwordConfirm: ''
    })

    const idCheckMessage = ref('')
    const idCheckMessageClass = ref('')

    watch(() => props.open, (newVal) => {
      state.dialogVisible = newVal
      if (newVal) {
        // 팝업이 열릴 때 폼 초기화
        state.form.department = ''
        state.form.position = ''
        state.form.name = ''
        state.form.id = ''
        state.form.password = ''
        state.form.passwordConfirm = ''
        errors.department = ''
        errors.position = ''
        errors.name = ''
        errors.id = ''
        errors.password = ''
        errors.passwordConfirm = ''
        state.idChecked = false
        state.idAvailable = false
        idCheckMessage.value = ''
      }
    })

    // 실시간 유효성 검사
    watch(() => state.form.department, (newVal) => {
      if (newVal && newVal.length > 30) {
        errors.department = '최대 30자까지 입력 가능합니다.'
      } else {
        errors.department = ''
      }
    })

    watch(() => state.form.position, (newVal) => {
      if (newVal && newVal.length > 30) {
        errors.position = '최대 30자까지 입력 가능합니다.'
      } else {
        errors.position = ''
      }
    })

    watch(() => state.form.name, (newVal) => {
      validateName(newVal)
    })

    watch(() => state.form.id, (newVal) => {
      validateId(newVal)
      // 아이디가 변경되면 중복 확인 초기화
      if (newVal !== state.form.id) {
        state.idChecked = false
        state.idAvailable = false
        idCheckMessage.value = ''
      }
    })

    watch(() => state.form.password, (newVal) => {
      validatePassword(newVal)
      // 비밀번호가 변경되면 비밀번호 확인도 다시 검사
      if (state.form.passwordConfirm) {
        validatePasswordConfirm(state.form.passwordConfirm)
      }
    })

    watch(() => state.form.passwordConfirm, (newVal) => {
      validatePasswordConfirm(newVal)
    })

    const validateName = (name) => {
      if (!name) {
        errors.name = '필수 입력 항목입니다.'
        return false
      } else if (name.length > 30) {
        errors.name = '최대 30자까지 입력 가능합니다.'
        return false
      } else {
        errors.name = ''
        return true
      }
    }

    const validateId = (id) => {
      if (!id) {
        errors.id = '필수 입력 항목입니다.'
        return false
      } else if (id.length > 16) {
        errors.id = '최대 16자까지 입력 가능합니다.'
        return false
      } else if (state.idChecked && !state.idAvailable) {
        errors.id = '이미 존재하는 아이디입니다.'
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

    const validatePasswordConfirm = (passwordConfirm) => {
      if (!passwordConfirm) {
        errors.passwordConfirm = '필수 입력 항목입니다.'
        return false
      } else if (passwordConfirm !== state.form.password) {
        errors.passwordConfirm = '입력한 비밀번호와 일치하지 않습니다.'
        return false
      } else {
        errors.passwordConfirm = ''
        return true
      }
    }

    const checkIdDuplicate = async () => {
      if (!state.form.id) {
        errors.id = '아이디를 입력해주세요.'
        return
      }
      if (state.form.id.length > 16) {
        errors.id = '최대 16자까지 입력 가능합니다.'
        return
      }

      try {
        const response = await store.dispatch('accountStore/checkUserIdAction', state.form.id)
        state.idChecked = true
        const message = response.data.message
        if (message.includes('이미 존재하는 아이디입니다')) {
          state.idAvailable = false
          idCheckMessage.value = '이미 존재하는 아이디입니다.'
          idCheckMessageClass.value = 'error'
        } else {
          state.idAvailable = true
          idCheckMessage.value = '사용 가능한 아이디입니다.'
          idCheckMessageClass.value = 'success'
        }
      } catch (error) {
        console.error('ID check error:', error)
      }
    }

    const loading = ref(false)

    const clickRegister = async () => {
      // 모든 필드 유효성 검사
      const nameValid = validateName(state.form.name)
      const idValid = validateId(state.form.id)
      const passwordValid = validatePassword(state.form.password)
      const passwordConfirmValid = validatePasswordConfirm(state.form.passwordConfirm)

      if (!nameValid || !idValid || !passwordValid || !passwordConfirmValid) {
        return
      }

      // 아이디 중복 확인 체크
      if (!state.idChecked || !state.idAvailable) {
        ElMessage.error('아이디 중복 확인을 해주세요.')
        return
      }

      loading.value = true
      try {
        await store.dispatch('accountStore/registerAction', {
          id: state.form.id,
          password: state.form.password,
          department: state.form.department || null,
          position: state.form.position || null,
          name: state.form.name
        })
        ElMessage.success('회원가입이 완료되었습니다.')
        handleClose()
      } catch (error) {
        ElMessage.error('회원가입에 실패하였습니다.')
        console.error('Register error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleClose = () => {
      state.form.department = ''
      state.form.position = ''
      state.form.name = ''
      state.form.id = ''
      state.form.password = ''
      state.form.passwordConfirm = ''
      errors.department = ''
      errors.position = ''
      errors.name = ''
      errors.id = ''
      errors.password = ''
      errors.passwordConfirm = ''
      state.idChecked = false
      state.idAvailable = false
      idCheckMessage.value = ''
      emit('closeRegisterDialog')
    }

    const isFormValid = computed(() => {
      const nameValid = state.form.name && state.form.name.length <= 30 && !errors.name
      const idValid = state.form.id && 
                      state.form.id.length <= 16 && 
                      state.idChecked && 
                      state.idAvailable && 
                      !errors.id
      const passwordValid = state.form.password && 
                           state.form.password.length >= 9 && 
                           state.form.password.length <= 16 &&
                           /[a-zA-Z]/.test(state.form.password) &&
                           /[0-9]/.test(state.form.password) &&
                           /[!@#$%^&*(),.?":{}|<>]/.test(state.form.password) &&
                           !errors.password
      const passwordConfirmValid = state.form.passwordConfirm && 
                                  state.form.passwordConfirm === state.form.password &&
                                  !errors.passwordConfirm
      const departmentValid = !state.form.department || state.form.department.length <= 30
      const positionValid = !state.form.position || state.form.position.length <= 30

      return nameValid && idValid && passwordValid && passwordConfirmValid && departmentValid && positionValid
    })

    return { state, errors, registerForm, clickRegister, handleClose, loading, isFormValid, checkIdDuplicate, idCheckMessage, idCheckMessageClass }
  }
}
</script>
