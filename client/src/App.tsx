import VideoList from "./components/VideoList";
import VideoUpload from "./components/VideoUpload";
import styled from "styled-components";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store";
import { PasswordGate } from "./components/PasswordGate";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SingleVideoView from "./components/SingleVideoView";
import ArchiveList from "./components/ArchiveList";

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

const Header = styled.header`
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 1rem 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: #00012e;
  flex-grow: 1;
  padding: 0px 12px;
`;

const Main = styled.main`
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.25%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Image = styled.img`
  height: 80px;
`;

function App() {
  return (
    <Provider store={store}>
      <PasswordGate>
        <BrowserRouter>
          <AppContainer>
            <Toaster position="top-right" />
            <Header>
              <HeaderContent>
                <Image src="/hang.svg" />
                <HeaderTitle>SilkStream</HeaderTitle>
                <VideoUpload />
              </HeaderContent>
            </Header>
            <Main>
              <Routes>
                <Route path="/" element={<VideoList />} />
                <Route path="/videos/:videoId" element={<SingleVideoView />} />
                <Route path="/videos-archive" element={<ArchiveList />} />
              </Routes>
            </Main>
          </AppContainer>
        </BrowserRouter>
      </PasswordGate>
    </Provider>
  );
}

export default App;
