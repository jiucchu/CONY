package com.ssafy.db.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.db.entity.QConferenceCategory;
import com.ssafy.db.entity.ConferenceCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ConferenceCategoryRepositorySupport {
    @Autowired
    private JPAQueryFactory jpaQueryFactory;
    QConferenceCategory qConferenceCategory = QConferenceCategory.conferenceCategory;
}
