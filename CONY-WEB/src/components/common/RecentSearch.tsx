'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const RecentSearchContainer = styled.div<{ $top: number }>`
  position: fixed;
  top: ${props => props.$top}px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 100%;
  background-color: ${COLORS.white};
  border-radius: 20px;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

const TitleSection = styled.div`
  margin-bottom: 16px;
`;

const SearchListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
`;

const SearchItem = styled.div`
  padding: 8px 0;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

interface RecentSearchProps {
  searches?: string[];
  onSearchClick?: (searchTerm: string) => void;
  top?: number;
}

const RecentSearch = ({ 
  searches = [], 
  onSearchClick,
  top = 80
}: RecentSearchProps) => {
  return (
    <RecentSearchContainer $top={top}>
      <TitleSection>
        <StyledText 
          fontSize={16} 
          fontWeight={600} 
          color={COLORS.text.primary}
        >
          최근 검색어
        </StyledText>
      </TitleSection>
      <SearchListContainer>
        {searches.length === 0 ? (
          <StyledText 
            fontSize={14} 
            fontWeight={400} 
            color={COLORS.text.secondary}
          >
            최근 검색어가 없습니다.
          </StyledText>
        ) : (
          searches.map((search, index) => (
            <SearchItem 
              key={index}
              onClick={() => onSearchClick?.(search)}
            >
              <StyledText 
                fontSize={14} 
                fontWeight={400} 
                color={COLORS.text.primary}
              >
                {search}
              </StyledText>
            </SearchItem>
          ))
        )}
      </SearchListContainer>
    </RecentSearchContainer>
  );
};

export default RecentSearch;