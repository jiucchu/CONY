import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '@/constants/colors';
import MainGiftCardCarousel from '@/components/common/card/MainGiftCardCarousel';
import CouponList from '@/components/common/card/CouponList';
import MainLayout from '@/components/layout/MainLayout';
import { StyledText } from '@/utils/StyledText';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';

const ContentArea = styled.View`
  flex-direction: column;
`;

const GradientContainer = styled.View`
  padding-bottom: 32px;
`;

const LandingViewContainer = styled.View`
  background-color: #f5f5f5;
  padding-bottom: 32px;
`;

const MainTitleContainer = styled.View`
  padding-top: 60px;
  padding-left: 40px;
`;

const TitleContainer = styled.View`
  z-index: 1;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const TitleRow2 = styled.View`
  flex-direction: row;
  align-items: center;
`;

const MainPage = () => {
  const navigation = useNavigation();
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const [userName, setUserName] = useState('CONY');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 20 });
        setCoupons(response.content);
      } catch (err) {
        console.error('기프티콘 목록 조회 실패:', err);
      }
    };
    fetchCoupons();
  }, []);

  const handleScroll = (scrollTop: number) => {
    setIsAtTop(scrollTop === 0);
  };

  const handleMoreClick = () => {
    (navigation as any).navigate('CouponList');
  };

  const mainTitle = (name: string) => {
    return (
      <TitleContainer>
        <TitleRow>
          <StyledText
            fontSize={23}
            fontWeight={900}
            color={isAtTop ? COLORS.white : COLORS.text.primary}
          >
            {name}
          </StyledText>
          <StyledText
            fontSize={23}
            fontWeight={600}
            color={isAtTop ? COLORS.white : COLORS.text.primary}
          >
            님
          </StyledText>
        </TitleRow>
        <TitleRow2>
          <StyledText
            fontSize={30}
            fontWeight={900}
            color={isAtTop ? COLORS.white : COLORS.primary}
          >
            지금 쓰기 좋은 쿠폰
          </StyledText>
          <StyledText
            fontSize={30}
            fontWeight={600}
            color={isAtTop ? COLORS.white : COLORS.text.primary}
          >
            이에요
          </StyledText>
        </TitleRow2>
      </TitleContainer>
    );
  };

  // 유효기간 임박 쿠폰 필터링 (D-day가 30일 이하인 쿠폰, 만료되지 않은 쿠폰만)
  const expiringSoonCoupons = coupons
    .map((coupon) => {
      const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
      return { coupon, daysUntilExpiration };
    })
    .filter(({ daysUntilExpiration }) => daysUntilExpiration >= 0 && daysUntilExpiration <= 30)
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration) // D-day가 가까운 순으로 정렬
    .slice(0, 10) // 최대 10개만 표시
    .map(({ coupon }) => coupon);

  console.log('전체 쿠폰 수:', coupons.length);
  console.log('유효기간 임박 쿠폰 수:', expiringSoonCoupons.length);
  if (expiringSoonCoupons.length > 0) {
    console.log('유효기간 임박 쿠폰 목록:', expiringSoonCoupons.map(c => ({
      name: c.productName,
      expiryDate: c.expiryDate,
      dday: calculateDaysUntilExpiration(c.expiryDate)
    })));
  }


  return (
    <MainLayout onScroll={handleScroll} isAtTop={isAtTop}>
      {isAtTop ? (
        <LinearGradient
          colors={[COLORS.primary, '#f5f5f5', 'rgba(224, 224, 224, 0)']}
          locations={[0, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <GradientContainer>
            <MainTitleContainer>
              {mainTitle(userName)}
            </MainTitleContainer>
            {coupons.length > 0 && (
              <MainGiftCardCarousel coupons={coupons.slice(0, 5)} />
            )}
          </GradientContainer>
        </LinearGradient>
      ) : (
        <LandingViewContainer>
          <MainTitleContainer>
            {mainTitle(userName)}
          </MainTitleContainer>
          {coupons.length > 0 && (
            <MainGiftCardCarousel coupons={coupons.slice(0, 5)} />
          )}
        </LandingViewContainer>
      )}
      {coupons.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <CouponList
            coupons={coupons}
            title="근처 사용 가능 쿠폰"
            onMoreClick={handleMoreClick}
          />
        </View>
      )}

        <View style={{ marginTop: coupons.length > 0 ? 32 : 0 }}>
          <CouponList
            coupons={expiringSoonCoupons}
            title="유효기간 임박 쿠폰"
            onMoreClick={handleMoreClick}
          />
        </View>
      
    </MainLayout>
  );
};

export default MainPage;
