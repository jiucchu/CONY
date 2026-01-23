import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';

export type AvailableType = 'all' | 'available' | 'used';

interface AvailableFilterProps {
  selectedType?: AvailableType;
  onTypeChange?: (type: AvailableType) => void;
}

const FilterContainer = styled.View`
  flex-direction: row;
  width: 100%;
  padding-horizontal: 12%;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${COLORS.background.lightGray};
`;

const TabButton = styled.TouchableOpacity`
  padding-bottom: 12px;
  position: relative;
`;

const Indicator = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: ${COLORS.primary};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

const AvailableFilter: React.FC<AvailableFilterProps> = ({
  selectedType: initialType = 'available',
  onTypeChange,
}) => {
  const [selectedType, setSelectedType] = useState<AvailableType>(initialType);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const handleTabClick = (type: AvailableType) => {
    setSelectedType(type);
    onTypeChange?.(type);
  };

  return (
    <FilterContainer>
      <TabButton
        onPress={() => handleTabClick('all')}
        activeOpacity={0.7}
      >
        <StyledText
          fontSize={16}
          fontWeight={500}
          color={COLORS.text.primary}
        >
          전체보기
        </StyledText>
        {selectedType === 'all' && <Indicator />}
      </TabButton>
      
      <TabButton
        onPress={() => handleTabClick('available')}
        activeOpacity={0.7}
      >
        <StyledText
          fontSize={16}
          fontWeight={500}
          color={COLORS.text.primary}
        >
          사용가능
        </StyledText>
        {selectedType === 'available' && <Indicator />}
      </TabButton>
      
      <TabButton
        onPress={() => handleTabClick('used')}
        activeOpacity={0.7}
      >
        <StyledText
          fontSize={16}
          fontWeight={500}
          color={COLORS.text.primary}
        >
          사용완료
        </StyledText>
        {selectedType === 'used' && <Indicator />}
      </TabButton>
    </FilterContainer>
  );
};

export default AvailableFilter;
