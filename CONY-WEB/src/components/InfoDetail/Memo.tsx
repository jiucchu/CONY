'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";

const MemoContainer = styled.div<{ type: 'mine' | 'other' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: ${props => props.type === 'mine' ? 'flex-end' : 'flex-start'};
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${COLORS.background.lightGray};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageBubble = styled.div<{ type: 'mine' | 'other' }>`
  position: relative;
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => props.type === 'mine' ? COLORS.background.lightGray : COLORS.white};
  border: ${props => props.type === 'other' ? `1px solid ${COLORS.background.lightGray}` : 'none'};
`;

const MessageText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

interface MemoProps {
  type: 'mine' | 'other';
  content: string;
  avatarUrl?: string;
}

const Memo = ({ type, content, avatarUrl }: MemoProps) => {
  return (
    <MemoContainer type={type}>
      {type === 'other' && (
        <AvatarCircle>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="avatar" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : null}
        </AvatarCircle>
      )}
      <MessageBubble type={type}>
        <MessageText>{content}</MessageText>
      </MessageBubble>
    </MemoContainer>
  );
};

export default Memo;
