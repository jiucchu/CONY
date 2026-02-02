import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const TabContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${COLORS.background.lightGray};
  padding-horizontal: 20px;
`;

const Tab = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding-vertical: 16px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) => (props.active ? COLORS.primary : 'transparent')};
`;

type TabType = 'PENDING' | 'ON_SALE' | 'SOLD_OUT';

interface SaleTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const SaleTabBar = ({ activeTab, onTabChange }: SaleTabBarProps) => {
  return (
    <TabContainer>
      <Tab active={activeTab === 'PENDING'} onPress={() => onTabChange('PENDING')}>
        <StyledText 
          fontSize={14} 
          fontWeight={activeTab === 'PENDING' ? 700 : 400} 
          color={activeTab === 'PENDING' ? COLORS.primary : COLORS.text.secondary}
        >
          판매 대기
        </StyledText>
      </Tab>
      <Tab active={activeTab === 'ON_SALE'} onPress={() => onTabChange('ON_SALE')}>
        <StyledText 
          fontSize={14} 
          fontWeight={activeTab === 'ON_SALE' ? 700 : 400} 
          color={activeTab === 'ON_SALE' ? COLORS.primary : COLORS.text.secondary}
        >
          판매중
        </StyledText>
      </Tab>
      <Tab active={activeTab === 'SOLD_OUT'} onPress={() => onTabChange('SOLD_OUT')}>
        <StyledText 
          fontSize={14} 
          fontWeight={activeTab === 'SOLD_OUT' ? 700 : 400} 
          color={activeTab === 'SOLD_OUT' ? COLORS.primary : COLORS.text.secondary}
        >
          판매 완료
        </StyledText>
      </Tab>
    </TabContainer>
  );
};

export default SaleTabBar;
