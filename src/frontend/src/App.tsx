import { Toaster } from "@/components/ui/sonner";
import CallPage from "@/pages/CallPage";
import ChatPage from "@/pages/ChatPage";
import LandingPage from "@/pages/LandingPage";
import MessagesPage from "@/pages/MessagesPage";
import SelectPage from "@/pages/SelectPage";
import VideoPage from "@/pages/VideoPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const selectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select",
  component: SelectPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const callRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/call",
  component: CallPage,
});

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video",
  component: VideoPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  selectRoute,
  chatRoute,
  messagesRoute,
  callRoute,
  videoRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
