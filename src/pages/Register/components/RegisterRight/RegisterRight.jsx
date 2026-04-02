import images from "~/assets";
import classNames from "classnames/bind";
import styles from "./RegisterRight.module.scss";
import { MdOutlineElectricBolt } from "react-icons/md";
import { RiBrainLine } from "react-icons/ri";
const cx = classNames.bind(styles);

function RegisterRight() {
  return (
    <div>
      <div className={cx("bannerWrap")}>
              <div className={cx("logo")}>
                <img src={images.logo} alt="CvProAI" className={cx("logo-img")} />
              </div>
      
              <h2 className={cx("bannerTitle")}>
                Nâng tầm sự nghiệp với trí tuệ nhân tạo
              </h2>
              <p className={cx("bannerDesc")}>
                Tạo CV chuyên nghiệp chuẩn ATS chỉ trong vài phút. Hãy để AI tối ưu
                hóa kỹ năng và kinh nghiệm của bạn để thu hút nhà tuyển dụng hàng đầu.
              </p>
      
              <div className={cx("bannerCards")}>
                <div className={cx("bannerCard")}>
                  <div className={cx("cardIconWrap")}>
                    <MdOutlineElectricBolt className={cx("cardIcon")} />
                  </div>
                  <div className={cx("cardInfo")}>
                    <h4 className={cx("cardTitle")}>Nhanh chóng</h4>
                    <p className={cx("cardDesc")}>Hoàn thành CV trong 5 phút</p>
                  </div>
                </div>
                <div className={cx("bannerCard")}>
                  <div className={cx("cardIconWrap")}>
                    <RiBrainLine className={cx("cardIcon")} />
                  </div>
                  <div className={cx("cardInfo")}>
                    <h4 className={cx("cardTitle")}>Thông minh</h4>
                    <p className={cx("cardDesc")}>Gợi ý nội dung theo ngành nghề</p>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
}

export default RegisterRight;
