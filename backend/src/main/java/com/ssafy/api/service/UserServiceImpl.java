package com.ssafy.api.service;

import com.ssafy.api.request.UserUpdateInfoPatchReq;
import com.ssafy.db.repository.ConferenceHistoryRepositorySupport;
import com.ssafy.db.repository.ConferenceRepositorySupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ssafy.api.request.UserRegisterPostReq;
import com.ssafy.db.entity.User;
import com.ssafy.db.repository.UserRepository;
import com.ssafy.db.repository.UserRepositorySupport;
import org.springframework.transaction.annotation.Transactional;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 구현 정의.
 */
@Service("userService")
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
	@Autowired UserRepository userRepository;
	
	@Autowired UserRepositorySupport userRepositorySupport;
	@Autowired ConferenceRepositorySupport conferenceRepositorySupport;
	@Autowired ConferenceHistoryRepositorySupport conferenceHistoryRepositorySupport;
	
	@Autowired PasswordEncoder passwordEncoder;
	
	@Override
	@Transactional
	public User createUser(UserRegisterPostReq userRegisterInfo) {
		User user = new User();
		user.setUserId(userRegisterInfo.getId());
		// 보안을 위해서 유저 패스워드 암호화 하여 디비에 저장.
		user.setPassword(passwordEncoder.encode(userRegisterInfo.getPassword()));
		return userRepository.save(user);
	}

	@Override
	public User getUserByUserId(String userId) {
		// 디비에 유저 정보 조회 (userId 를 통한 조회).
		User user = userRepositorySupport.findUserByUserId(userId).orElse(null);
		return user;
	}

	@Override
	@Transactional
	public void updateUser(String userId, UserUpdateInfoPatchReq updateInfo) {
		User user = userRepositorySupport.findUserByUserId(userId).orElseThrow();

		user.setDepartment(updateInfo.getDepartment());
		user.setPosition(updateInfo.getPosition());
		user.setName(updateInfo.getName());
	}

	@Override
	@Transactional
	public void withdraw(String userId) {
		conferenceRepositorySupport.deleteByOwnerId(userId);
		conferenceHistoryRepositorySupport.deleteByUserId(userId);
		userRepositorySupport.deleteByUserId(userId);
	}
}
