import MyInfoCard from '@/components/mypage/MyInfoCard';
import styled from 'styled-components'; 
import ContentLayout from '@/components/layout/ContentLayout';
import ConnectAccount from '@/components/mypage/ConnectAccount';

const MypageContainer = styled.div`
  padding: 5% 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const Mypage = () => {
  return (
    <ContentLayout>
      <MypageContainer>
        <MyInfoCard />
        <ConnectAccount />
      </MypageContainer>
    </ContentLayout>
  );
};

export default Mypage;