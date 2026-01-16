package com.ssafy.db.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.db.entity.QUserConference;
import com.ssafy.db.entity.UserConference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserConferenceRepositorySupport {
    @Autowired
    private JPAQueryFactory jpaQueryFactory;
    QUserConference qUserConference = QUserConference.userConference;
}
