import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import { getCvEditorDetail, saveCv } from '~/services/cv-editor.service';
import HeaderEditor from './components/HeaderEditor';
import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import styles from './CvEditor.module.scss';

const cx = classNames.bind(styles);

function CvEditor() {
  // const navigate = useNavigate();
  const { cvId } = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [cvName, setCvName] = useState('CV chưa đặt tên');
  const [resumeData, setResumeData] = useState({});
  const [templateConfig, setTemplateConfig] = useState({});

  const [openSections, setOpenSections] = useState({
    personal_info: true,
    summary: false,
    skills: false,
    experience: false,
    projects: false,
    education: false,
    certificates: false,
  });

  useEffect(() => {
    const fetchCvDetail = async () => {
      try {
        setLoading(true);

        const result = await getCvEditorDetail(cvId);

        if (!result?.success) {
          throw new Error(result?.message || 'Không thể tải dữ liệu CV');
        }

        const data = result?.data || {};

        setCvName(data?.name || 'CV chưa đặt tên');
        setResumeData(data?.resume_data || {});
        setTemplateConfig(data?.template_config || {});
      } catch (error) {
        toast.error(
          error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
        );
      } finally {
        setLoading(false);
      }
    };

    if (cvId) {
      fetchCvDetail();
    }
  }, [cvId]);

  // const handleBack = () => {
  //   navigate(-1);
  // };

  // const handleChooseTemplate = () => {
  //   navigate('/cv-templates');
  // };

  const handleSaveCv = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const result = await saveCv(cvId, {
        name: cvName,
        resume_data: resumeData,
      });

      if (!result?.success) {
        throw new Error(result?.message || 'Lưu CV thất bại');
      }

      toast.success(result?.message || 'Lưu CV thành công');
    } catch (error) {
      toast.error(
        error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    toast.info('Tính năng tải PDF sẽ được triển khai sau');
  };

  const handleAddSection = () => {
    toast.info('Tính năng thêm mục sẽ được triển khai sau');
  };

  const handleToggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangeField = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeArrayField = (field, value) => {
    const nextValue = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setResumeData((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };
  const handleChangeObjectInArray = (field, index, key, value) => {
    const newArr = [...(resumeData[field] || [])];
    newArr[index] = { ...newArr[index], [key]: value };
    setResumeData((prev) => ({ ...prev, [field]: newArr }));
  };
  const sectionList = useMemo(
    () => [
      {
        key: 'personal_info',
        title: 'Thông tin cá nhân',
        type: 'personal_info',
        number: 1,
      },
      {
        key: 'summary',
        title: 'Mục tiêu nghề nghiệp',
        type: 'summary',
        number: 2,
      },
      {
        key: 'skills',
        title: 'Kỹ năng',
        type: 'skills',
        number: 3,
      },
      {
        key: 'experience',
        title: 'Kinh nghiệm làm việc',
        type: 'experience',
        number: 4,
      },
      {
        key: 'projects',
        title: 'Dự án',
        type: 'projects',
        number: 5,
      },
      {
        key: 'education',
        title: 'Học vấn',
        type: 'education',
        number: 6,
      },
      {
        key: 'certificates',
        title: 'Chứng chỉ',
        type: 'certificates',
        number: 7,
      },
    ],
    [],
  );

  if (loading) {
    return (
      <section className={cx('wrapper')}>
        <div className={cx('loading')}>Đang tải dữ liệu...</div>
      </section>
    );
  }

  return (
    <section className={cx('wrapper')}>
      {/* <HeaderEditor
        onBack={handleBack}
        onChooseTemplate={handleChooseTemplate}
      /> */}

      <div className={cx('inner')}>
        <LeftEditor
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sectionList={sectionList}
          openSections={openSections}
          onToggleSection={handleToggleSection}
          resumeData={resumeData}
          onChangeField={handleChangeField}
          onChangeArrayField={handleChangeArrayField}
          onChangeObjectInArray={handleChangeObjectInArray}
          onAddSection={handleAddSection} onSaveCv={handleSaveCv}
          onDownloadPdf={handleDownloadPdf}
          submitting={submitting}
        />

        <RightPreview
          resumeData={resumeData}
          templateConfig={templateConfig}
        />
      </div>
    </section>
  );
}

export default CvEditor;