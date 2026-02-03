import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ClaimProgressBar } from '../../../components/claim/ClaimProgressBar';
import { ClaimStepTitle } from '@/components/claim/ClaimStepTitle';
import { ClaimOptionList } from '@/components/claim/ClaimOptionList';

const CouponClaim = () => {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  const MAIN_OPTIONS = ['쿠폰을 사용할 수 없어요', '정보가 실제와 달라요', '기타 불편한 점이 있어요'];
  const SUB_OPTIONS = ['이미 사용된 쿠폰이라고 나와요', '유효기간이 안내된 것보다 짧아요', '잔액이 표시된 금액보다 적어요', '바코드가 인식이 안 돼요', '다른 상품이 등록되어 있어요'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>신고하기</Text>
        <View style={styles.emptyRight} />
      </View>

      <ClaimProgressBar step={step} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View>
            <ClaimStepTitle step={1} mainTitle="기프티콘에 문제가 있나요?" subTitle="신고하는 이유를 선택해주세요." />
            <ClaimOptionList options={MAIN_OPTIONS} onSelect={() => setStep(2)} />
          </View>
        )}

        {step === 2 && (
          <View>
            <ClaimStepTitle step={2} mainTitle="기프티콘에 문제가 있나요?" subTitle="신고하는 이유를 선택해주세요." />
            <ClaimOptionList options={SUB_OPTIONS} onSelect={() => setStep(3)} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.finishContainer}>
            <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
            <Text style={styles.finishTitle}>신고 접수 완료</Text>
            <Text style={styles.finishDesc}>불편을 드려 죄송합니다.{"\n"}빠르게 처리 후 결과를 안내해 드리겠습니다.</Text>
            
            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('CouponBox' as never)}>
              <Text style={styles.homeButtonText}>내 쿠폰으로 돌아가기</Text>
              <Text style={styles.homeButtonArrow}>〉</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40 },
  backIcon: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptyRight: { width: 40 },
  scrollContent: { padding: 24 },
  finishContainer: { alignItems: 'center', paddingTop: 80 },
  checkCircle: { width: 56, height: 56, backgroundColor: '#E91E63', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  checkIcon: { color: '#fff', fontSize: 28 },
  finishTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  finishDesc: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 48, lineHeight: 22 },
  homeButton: { backgroundColor: '#E91E63', width: '100%', paddingVertical: 18, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  homeButtonArrow: { color: '#fff', fontSize: 18 }
});

export default CouponClaim;