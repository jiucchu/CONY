'use client';

import styled from "styled-components"; 
import { useState } from "react";
import ContentLayout from "@/components/layout/ContentLayout";
import BarFilter from "@/components/payment/common/BarFilter";
import Filter from "@/components/payment/common/Filter";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons, getBrands } from "@/mockDB/mock";
import SearchBar from "@/components/payment/common/SearchBar";
import BrandFilterBar from "@/components/payment/common/BrandFilterBar";
import CommonCouponCard from "@/components/common/card/CommonCouponCard";
import RecentSearch from "@/components/common/RecentSearch";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const coupons = getCoupons();
    const brands = getBrands();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches] = useState<string[]>([]); 

    const handleScroll = () => {
        if (isSearchFocused) {
            setIsSearchFocused(false);
        }
    };

    return (
        <ContentLayout onScroll={handleScroll}>
            <MainContainer>
                <SearchBar onFocusChange={setIsSearchFocused} />
                {isSearchFocused && (
                    <RecentSearch 
                        searches={recentSearches}
                        top={140}
                        onSearchClick={(term) => {
                            console.log('검색어 클릭:', term);
                        }}
                    />
                )}
                <CouponList coupons={coupons} title="추천 상품" />
                <BarFilter />
                <BrandFilterBar brands={brands} />

                <Filter />
                <CouponContainer>
                    {coupons.map((coupon) => (
                        <CouponWrapper key={coupon.gifticonId}>
                            <CommonCouponCard key={coupon.gifticonId} coupon={coupon} handleCardClickProps={() => router.push(`/payment/detail?id=${coupon.gifticonId}`)} />
                        </CouponWrapper>
                    ))}
                </CouponContainer>
            </MainContainer>
            
        </ContentLayout>
    );
};

export default Main;