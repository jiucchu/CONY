package com.ssafy.db.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.db.entity.QConferenceHistory;
import com.ssafy.db.entity.ConferenceHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ConferenceHistoryRepositorySupport {
    @Autowired
    private JPAQueryFactory jpaQueryFactory;
    QConferenceHistory qConferenceHistory = QConferenceHistory.conferenceHistory;
}
