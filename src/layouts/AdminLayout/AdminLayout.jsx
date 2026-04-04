import classNames from "classnames/bind";
import SidebarAdmin from "~/layouts/components/SidebarAdmin";
import Header from "../components/Header";
import styles from "./AdminLayout.module.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  return (
    <div className={cx("wrapper")}>
      <SidebarAdmin className={cx("sidebar")} />

      <div className={cx("container")}>
        <Header className={cx("header")} />
        <ToastContainer position="top-right" autoClose={2500} />
        <main className={cx("content")}>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
