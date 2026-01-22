import MyInfoCard from '@/components/mypage/MyInfoCard';
import styled from 'styled-components'; 
import ContentLayout from '@/components/layout/ContentLayout';
import ConnectAccount from '@/components/mypage/ConnectAccount';
import CouponStatTable from '@/components/mypage/CouponStatTable';
import WithdrawButton from '@/components/mypage/WithdrawButton';
import CouponList from '@/components/common/card/CouponList';
import { getCoupons } from '@/mockDB/mock';
import { COLORS } from '@/constants/colors';

const MypageContainer = styled.div`
  padding: 5% 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: center;
  align-items: center;
  margin: 2% 0 10% 0;
`;

const Mypage = () => {
  return (
    <ContentLayout>
      <MypageContainer>
        <MyInfoCard />
        <CouponStatTable myCouponCount={0} sharedCouponCount={0} soldCouponCount={0} />
        <div style={{ width: '100%', borderBottom: `1px solid ${COLORS.background.lightGray}` }}>
          <CouponList coupons={getCoupons()} title="판매 중인 기프티콘" />
        </div>
        <ConnectAccount />
        <WithdrawButton />
      </MypageContainer>
    </ContentLayout>
  );
};

export default Mypage;