import { FC } from "react";
import { Outlet } from "react-router-dom";

const PublicLayout: FC = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
