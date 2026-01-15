<template>
  <div v-if="state.dialogVisible" class="login-dialog-overlay">
    <div class="login-dialog" style="width: 500px;">
      <div class="login-dialog-header">
        <h3>회원가입</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      <form @submit.prevent="clickSignup">
        <!-- ID -->
        <div class="form-group">
          <label for="reg-id">아이디 <span class="required">*</span></label>
          <div style="display: flex; gap: 10px;">
            <input 
              type="text" 
              id="reg-id" 
              v-model="state.form.id" 
              @input="onIdInput"
              maxlength="16"
              autocomplete="off" 
            />
            <button type="button" @click="checkDuplicateId" :disabled="!state.form.id || state.isIdChecked">중복확인</button>
          </div>
          <span v-if="errors.id" class="error">{{ errors.id }}</span>
          <span v-if="state.isIdChecked" class="success-msg">사용 가능한 아이디입니다.</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="reg-password">비밀번호 <span class="required">*</span></label>
          <input 
            type="password" 
            id="reg-password" 
            v-model="state.form.password" 
            @input="validatePassword"
            maxlength="16"
            autocomplete="new-password" 
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>

        <!-- Password Confirm -->
        <div class="form-group">
          <label for="reg-password-confirm">비밀번호 확인 <span class="required">*</span></label>
          <input 
            type="password" 
            id="reg-password-confirm" 
            v-model="state.form.passwordConfirm" 
            @input="validatePasswordConfirm"
            maxlength="16"
            autocomplete="new-password" 
          />
          <span v-if="errors.passwordConfirm" class="error">{{ errors.passwordConfirm }}</span>
        </div>

        <!-- Name -->
        <div class="form-group">
          <label for="reg-name">이름</label>
          <input type="text" id="reg-name" v-model="state.form.name" maxlength="30" />
        </div>

        <!-- Position -->
        <div class="form-group">
          <label for="reg-position">직책</label>
          <input type="text" id="reg-position" v-model="state.form.position" maxlength="30" />
        </div>

        <!-- Department -->
        <div class="form-group">
          <label for="reg-department">소속</label>
          <input type="text" id="reg-department" v-model="state.form.department" maxlength="30" />
        </div>

        <div class="dialog-footer">
          <button type="submit" class="btn-primary" :disabled="!isFormValid">가입하기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.required { color: red; }
.success-msg { color: green; font-size: 12px; margin-top: 5px; display: block; }
.btn-primary:disabled { background-color: #ccc; cursor: not-allowed; }
</style>

<script>
import { reactive, computed, watch } from 'vue'
import { requestSignup, requestCheckDuplicateId } from '@/common/api/accountAPI'
import { ElMessage } from 'element-plus'

export default {
  name: 'SignupDialog',
  props: {
    open: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const state = reactive({
      dialogVisible: props.open,
      form: {
        id: '',
        password: '',
        passwordConfirm: '',
        name: '',
        position: '',
        department: ''
      },
      isIdChecked: false
    })

    const errors = reactive({
      id: '',
      password: '',
      passwordConfirm: ''
    })

    watch(() => props.open, (newVal) => {
      state.dialogVisible = newVal
      if (newVal) {
        // Reset form on open
        resetForm()
      }
    })

    const resetForm = () => {
      state.form = { id: '', password: '', passwordConfirm: '', name: '', position: '', department: '' }
      state.isIdChecked = false
      errors.id = ''
      errors.password = ''
      errors.passwordConfirm = ''
    }

    const onIdInput = () => {
      state.isIdChecked = false
      if (state.form.id.length > 16) {
        errors.id = '최대 16자까지 입력 가능합니다.'
      } else {
        errors.id = ''
      }
    }

    const checkDuplicateId = async () => {
      if (!state.form.id) return
      try {
        await requestCheckDuplicateId(state.form.id)
        state.isIdChecked = true
        ElMessage.success('사용 가능한 아이디입니다.')
      } catch (err) {
        if (err.response && err.response.status === 409) {
          errors.id = '이미 존재하는 사용자 ID 입니다.'
        } else {
          ElMessage.error('중복 확인 중 오류가 발생했습니다.')
        }
        state.isIdChecked = false
      }
    }

    const validatePassword = () => {
      const pw = state.form.password
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{9,16}$/
      if (!regex.test(pw)) {
        errors.password = '영문+숫자+특수문자 조합, 9~16자로 입력해주세요.'
      } else {
        errors.password = ''
      }
      if (state.form.passwordConfirm) validatePasswordConfirm()
    }

    const validatePasswordConfirm = () => {
      if (state.form.password !== state.form.passwordConfirm) {
        errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
      } else {
        errors.passwordConfirm = ''
      }
    }

    const isFormValid = computed(() => {
      return state.form.id && 
             state.isIdChecked && 
             state.form.password && 
             !errors.password && 
             state.form.passwordConfirm && 
             !errors.passwordConfirm
    })

    const clickSignup = async () => {
      if (!isFormValid.value) return
      
      try {
        await requestSignup({
          id: state.form.id,
          password: state.form.password,
          name: state.form.name,
          position: state.form.position,
          department: state.form.department
        })
        ElMessage.success('회원가입이 완료되었습니다.')
        handleClose()
      } catch (err) {
        ElMessage.error('회원가입 실패')
      }
    }

    const handleClose = () => {
      emit('closeSignupDialog')
    }

    return { state, errors, checkDuplicateId, validatePassword, validatePasswordConfirm, onIdInput, isFormValid, clickSignup, handleClose }
  }
}
</script>
