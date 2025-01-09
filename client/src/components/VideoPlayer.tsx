import React, { useEffect, useRef } from "react";
import styled from "styled-components";

interface VideoPlayerProps {
  url: string;
}

const Container = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-contents: center;
`;

const VideoWrapper = styled.div`
  width: 100%;
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  max-height: 80vh;
  transform: rotate180deg;
  transform-origin: center;
  display: block;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  &::-webkit-media-controls-panel {
    transform: rotate180deg;
  }
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [url]);

  return (
    <Container>
      <VideoWrapper>
        <StyledVideo ref={videoRef} controls controlsList="nodownload">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </StyledVideo>
      </VideoWrapper>
    </Container>
  );
};

export default VideoPlayer;
