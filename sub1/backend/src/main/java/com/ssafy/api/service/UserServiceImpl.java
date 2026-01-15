package com.ssafy.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ssafy.api.request.UserRegisterPostReq;
import com.ssafy.db.entity.User;
import com.ssafy.db.repository.UserRepository;
import com.ssafy.db.repository.UserRepositorySupport;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 구현 정의.
 */
@Service("userService")
public class UserServiceImpl implements UserService {
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	UserRepositorySupport userRepositorySupport;
	
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Override
	public User createUser(UserRegisterPostReq userRegisterInfo) {
		User user = new User();
		user.setUserId(userRegisterInfo.getId());
		// 보안을 위해서 유저 패스워드 암호화 하여 디비에 저장.
		user.setPassword(passwordEncoder.encode(userRegisterInfo.getPassword()));
		user.setName(userRegisterInfo.getName());
		user.setPosition(userRegisterInfo.getPosition());
		user.setDepartment(userRegisterInfo.getDepartment());
		return userRepository.save(user);
	}

	@Override
	public User getUserByUserId(String userId) {
		// 디비에 유저 정보 조회 (userId 를 통한 조회).
		User user = userRepositorySupport.findUserByUserId(userId).orElse(null);
		return user;
	}

	@Override
	public User updateUser(String userId, com.ssafy.api.request.UserUpdatePatchReq userUpdateInfo) {
		User user = getUserByUserId(userId);
		if(user != null) {
			if(userUpdateInfo.getName() != null) user.setName(userUpdateInfo.getName());
			if(userUpdateInfo.getPosition() != null) user.setPosition(userUpdateInfo.getPosition());
			if(userUpdateInfo.getDepartment() != null) user.setDepartment(userUpdateInfo.getDepartment());
			return userRepository.save(user);
		}
		return null;
	}

	@Override
	public void deleteUser(String userId) {
		User user = getUserByUserId(userId);
		if(user != null) {
			userRepository.delete(user);
		}
	}
}
