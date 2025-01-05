import VideoList from "./components/VideoList";
import VideoUpload from "./components/VideoUpload";
import styled from "styled-components";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store";

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

const Header = styled.header`
  background-color: white;
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
  color: #111827;
`;

const Main = styled.main`
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

function App() {
  return (
    <Provider store={store}>
      <AppContainer>
        <Toaster position="top-right" />
        <Header>
          <HeaderContent>
            <HeaderTitle>SilkStream</HeaderTitle>
            <VideoUpload />
          </HeaderContent>
        </Header>
        <Main>
          <VideoList />
        </Main>
      </AppContainer>
    </Provider>
  );
}

export default App;
