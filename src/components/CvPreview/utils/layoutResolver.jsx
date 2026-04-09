import StackLayout from '../layouts/StackLayout';
import SplitLayout from '../layouts/SplitLayout';
import BannerSplitLayout from '../layouts/BannerSplitLayout';

const layout = {
    STACK : StackLayout,
    SPLIT : SplitLayout,
    BANNER_SPLIT : BannerSplitLayout,
}
export default function layoutResolver(layoutType) {
  return layout[layoutType] ?? StackLayout
}