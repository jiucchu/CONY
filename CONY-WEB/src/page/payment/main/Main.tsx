'use client';

import styled from "styled-components"; 
import ContentLayout from "@/components/layout/ContentLayout";
import BarFilter from "@/components/payment/common/BarFilter";
import Filter from "@/components/payment/common/Filter";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons, getBrands } from "@/mockDB/mock";
import SearchBar from "@/components/payment/common/SearchBar";
import BrandFilterBar from "@/components/payment/common/BrandFilterBar";
import CommonCouponCard from "@/components/common/card/CommonCouponCard";

const MainContainer = styled.div`
    padding: 5% 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;


const CouponContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const CouponWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Main = () => {
    const coupons = getCoupons();
    const brands = getBrands();

    return (
        <ContentLayout>
            <MainContainer>
                <SearchBar />
                <CouponList coupons={coupons} title="추천 상품" />
                <BarFilter />
                <Filter />
                <BrandFilterBar brands={brands} />
                <CouponContainer>
                    {coupons.map((coupon) => (
                        <CouponWrapper key={coupon.coupon_id}>
                            <CommonCouponCard key={coupon.coupon_id} coupon={coupon} />
                        </CouponWrapper>
                    ))}
                </CouponContainer>
            </MainContainer>
            
        </ContentLayout>
    );
};

export default Main;