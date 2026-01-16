<template>
  <div class="main-sidebar" :style="{ width: width }">
    <div class="hide-on-small">
      <ul class="menu-vertical">
        <li
          v-for="(item, index) in state.menuItems"
          :key="index"
          :class="{ active: state.activeIndex === index }"
          @click="menuSelect(index)">
          <i v-if="item.icon" :class="['ic', item.icon]"></i>
          <span>{{ item.title }}</span>
        </li>
        <li v-if="state.isLoggedIn" @click="handleLogout" class="logout-item">
          <span>로그아웃</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'MainSidebar',

  props: {
    width: {
      type: String,
      default: '240px'
    }
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    const state = reactive({
      menuItems: computed(() => {
        const MenuItems = store.getters['menuStore/getMenus']
        const isLoggedIn = store.getters['accountStore/isLoggedIn']
        // 비로그인 상태에서는 홈만 표시
        if (!isLoggedIn) {
          return Object.keys(MenuItems)
            .filter(key => key === 'home')
            .map(key => ({
              icon: MenuItems[key].icon,
              title: MenuItems[key].name
            }))
        }
        // 로그인 상태에서는 모든 메뉴 표시
        return Object.keys(MenuItems).map(key => ({
          icon: MenuItems[key].icon,
          title: MenuItems[key].name
        }))
      }),
      activeIndex: computed(() => store.getters['menuStore/getActiveMenuIndex']),
      isLoggedIn: computed(() => store.getters['accountStore/isLoggedIn'])
    })

    if (state.activeIndex === -1) {
      state.activeIndex = 0
      store.commit('menuStore/setMenuActive', 0)
    }

    const menuSelect = (index) => {
      const MenuItems = store.getters['menuStore/getMenus']
      const isLoggedIn = store.getters['accountStore/isLoggedIn']
      // 필터링된 메뉴 키 가져오기
      let menuKeys
      if (!isLoggedIn) {
        menuKeys = Object.keys(MenuItems).filter(key => key === 'home')
      } else {
        menuKeys = Object.keys(MenuItems)
      }
      const selectedKey = menuKeys[index]
      store.commit('menuStore/setMenuActiveMenuName', selectedKey)
      router.push({ name: selectedKey })
    }

    const handleLogout = () => {
      store.dispatch('accountStore/logoutAction')
      router.push({ name: 'home' })
    }

    return { state, menuSelect, handleLogout }
  }
}
</script>

<style>
.main-sidebar {
  padding: 10px;
  background-color: #f5f5f5;
}

.hide-on-small {
  height: 100%;
}

.menu-vertical {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  overflow-y: auto;
}

.menu-vertical li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.menu-vertical li.active {
  background-color: #409eff;
  color: white;
}

.menu-vertical li .ic {
  margin-right: 10px;
}

.menu-vertical li.logout-item {
  margin-top: auto;
  color: #f56c6c;
}
</style>
