'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const TableContainer = styled.div`
  width: 90%;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 12px;
  overflow: hidden;
  background-color: ${COLORS.white};
`;

const TableRow = styled.div`
  display: flex;
  width: 100%;
`;

const HeaderRow = styled(TableRow)`
  background-color: #E0E0E0;
`;

const DataRow = styled(TableRow)`
  background-color: ${COLORS.white};
`;

const TableCell = styled.div`
  flex: 1;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid ${COLORS.background.lightGray};

  &:last-child {
    border-right: none;
  }
`;

const HeaderCell = styled(TableCell)`
  border-bottom: 1px solid ${COLORS.background.lightGray};
`;

const DataCell = styled(TableCell)``;

interface CouponStatTableProps {
  myCouponCount: number;
  sharedCouponCount: number;
  soldCouponCount: number;
}

const CouponStatTable = ({ myCouponCount, sharedCouponCount, soldCouponCount }: CouponStatTableProps) => {
  return (
    <TableContainer>
      <HeaderRow>
        <HeaderCell>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            나의 콘
          </StyledText>
        </HeaderCell>
        <HeaderCell>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            공유 중
          </StyledText>
        </HeaderCell>
        <HeaderCell>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            판매 중
          </StyledText>
        </HeaderCell>
      </HeaderRow>
      <DataRow>
        <DataCell>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {myCouponCount} 개
          </StyledText>
        </DataCell>
        <DataCell>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {myCouponCount} 개
          </StyledText>
        </DataCell>
        <DataCell>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {sharedCouponCount} 개
          </StyledText>
        </DataCell>
      </DataRow>
    </TableContainer>
  );
};

export default CouponStatTable;