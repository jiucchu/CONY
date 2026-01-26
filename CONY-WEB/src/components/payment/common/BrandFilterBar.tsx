'use client';

import styled from "styled-components";
import BrandButton from "@/components/payment/common/atomic/BrandButton";
import { useState } from "react";

const BrandFilterBarContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0 20px;
    gap: 5%;
`;

const BrandButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

const BrandFilterBar = ( { brands }: { brands: string[] } ) => {
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const selectButton = (brand: string) => {
        setSelectedBrand(brand);
    }
    return (
        <BrandFilterBarContainer>
            {brands.map((brand) => (
                <BrandButtonContainer key={brand}>
                    <BrandButton 
                        label={brand} 
                        isSelected={selectedBrand === brand}
                        onClick={() => selectButton(brand)} 
                    />
                </BrandButtonContainer>
            ))}
        </BrandFilterBarContainer>
    )
}   

export default BrandFilterBar;