package com.ssafy.db.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.db.entity.QConference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ConferenceRepositorySupport {
    @Autowired private JPAQueryFactory jpaQueryFactory;

    QConference qConference = QConference.conference;

    public Long deleteByOwnerId(String userId) {
        return jpaQueryFactory.delete(qConference)
                              .where(qConference.owner.userId.eq(userId))
                              .execute();
    }
}
