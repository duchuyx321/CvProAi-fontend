import classNames from 'classnames/bind';
import { MdEmail } from 'react-icons/md';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import Button from '~/components/Button';
import styles from './FooterDefault.module.scss';
import images from '~/assets';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const LINK_GROUPS = [
  {
    title: 'KHÁM PHÁ',
    links: [
      { label: 'Mẫu CV', to: '#' },
      { label: 'Việc làm mới', to: '#' },
      { label: 'Blog sự nghiệp', to: '#' },
    ],
  },
  {
    title: 'PHÁP LÝ',
    links: [
      { label: 'Điều khoản dịch vụ', to: '#' },
      { label: 'Chính sách bảo mật', to: '#' },
      { label: 'Liên hệ', to: '#' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Email',
    href: 'mailto:vanmanh.dev@gmail.com',
    icon: <MdEmail size={18} />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: <FaGithub size={18} />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: <FaLinkedinIn size={18} />,
  },
];

function FooterDefault() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('brand')}>
          <Link to="/" className={cx('logo-link')}>
            <img
              src={images.logo}
              alt="CvProAI Logo"
              className={cx('logo-img')}
            />
            <span className={cx('logo-name')}>CvProAI</span>
          </Link>

          <p className={cx('brand-desc')}>
            Nền tảng ứng dụng trí tuệ nhân tạo để
            <br />
            tối ưu hóa hành trình sự nghiệp của bạn.
          </p>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.title} className={cx('link-group')}>
            <h4 className={cx('group-title')}>{group.title}</h4>

            <ul className={cx('group-list')}>
              {group.links.map((link) => (
                <li key={link.label}>
                  <Button
                    to={link.to}
                    text
                    className={cx('group-link')}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={cx('social-group')}>
          <h4 className={cx('group-title')}>KẾT NỐI</h4>

          <div className={cx('social-list')}>
            {SOCIAL_LINKS.map((item) => (
              <Button
                key={item.label}
                href={item.href}
                text
                className={cx('social-link')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
              >
                {item.icon}
              </Button>
            ))}
          </div>

          <p className={cx('social-email')}>Email: vanmanh.dev@gmail.com</p>
        </div>
      </div>

      <div className={cx('bottom')}>
        <p className={cx('copyright')}>
          © {currentYear} CVPro AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default FooterDefault;