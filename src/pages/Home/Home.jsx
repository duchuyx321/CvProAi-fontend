import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import FeaturesSection from './components/FeatureSection';
import ProcessSection from './components/ProcessSection';
import BannerSection from './components/BannerSection';

const cx = classNames.bind(styles);

function Home() {
  return (
    <div className={cx('wrapper')}>
      <BannerSection/>
      <FeaturesSection />
      <ProcessSection />
    </div>
  );
}

export default Home;