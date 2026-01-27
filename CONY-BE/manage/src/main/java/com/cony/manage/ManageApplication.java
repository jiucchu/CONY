package com.cony.manage;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class ManageApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManageApplication.class, args);
	}

	@PostConstruct
	public void started() {
		// 서버가 켜질 때, JVM의 기본 시간대를 'Asia/Seoul'로 강제 설정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
//		System.out.println("현재 시간: " + new java.util.Date());
	}
}
