import DetailInfoCard from "@/components/payment/common/detail/DetailInfoCard";
import { DefaultButton } from "@/components/common/atomic/Button";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import ContentLayout from "@/components/layout/ContentLayout";
import { goBack } from "@/utils/utils";
import CouponList from "@/components/common/card/CouponList";
import { getMyGifticons } from "@/api/gifticon/gifticonApi";
import { useEffect, useState } from "react";
import { GifticonListResponseDto } from "@/types/gifticon/gifticon";

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
    const [recommendedCoupons, setRecommendedCoupons] = useState<GifticonListResponseDto[]>([]);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const response = await getMyGifticons({ page: 0, size: 10 });
                setRecommendedCoupons(response.content);
            } catch (err) {
                console.error('추천 쿠폰 조회 실패:', err);
            }
        };
        fetchRecommended();
    }, []);

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
            <CouponList coupons={recommendedCoupons} title="추천 쿠폰" />

        </ContentLayout>
    )
}

export default PaymentDetail;  