/* eslint-disable no-useless-escape */
import React from "react";
import { TIntroVideo } from "../../types"
import { VideoContainer } from "../ChatBubble/ChatBubbleStyles"

export const VideoDisplay = ({
  video,
  inner,
}: {
  video: TIntroVideo;
  inner: boolean;
}) => {
  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const getYouTubeId = (url: string) => {
    const regExp =
      // eslint-disable-next-line no-useless-escape
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isYouTubeUrl(video.url)) {
    const videoId = getYouTubeId(video.url);
    return (
      <VideoContainer inner={inner ? "true" : "false"}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer inner={inner ? "true" : "false"}>
      <video
        style={{ border: 0, borderRadius: "10px" }}
        src={video.url}
        controls
      ></video>
    </VideoContainer>
  );
};
