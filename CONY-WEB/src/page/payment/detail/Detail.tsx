import DetailInfoCard from "@/components/payment/common/detail/DetailInfoCard";
import { DefaultButton } from "@/components/common/atomic/Button";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import ContentLayout from "@/components/layout/ContentLayout";
import { goBack } from "@/utils/utils";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons } from "@/mockDB/mock";

const PaymentDetailContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10% ;
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
    padding: 24px;
`;

const PaymentDetail = ({ coupon }: { coupon: GifticonDetailResponseDto }) => {
    return (
        <ContentLayout headerType="back" headerTitle="쿠폰 구매" onBack={goBack}>
            <PaymentDetailContainer>
                <DetailInfoCard coupon={coupon} />
                <ButtonWrapper>
                <DefaultButton >
                    구매하기
                </DefaultButton>
                </ButtonWrapper>
            </PaymentDetailContainer>
            <CouponList coupons={getCoupons()} title="추천 쿠폰" />

        </ContentLayout>
    )
}

export default PaymentDetail;  