import React, { useMemo, useState } from "react";
import styles from "./Export.module.scss";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsFiletypePdf } from "react-icons/bs";

const exportData = [
  {
    id: 1,
    fileName: "CV_NguyenVanA_Frontend.pdf",
    meta: "2.4 MB • PDF Document",
    exportedAt: "08/04/2026 10:32",
  },
  {
    id: 2,
    fileName: "CV_Product_Manager.pdf",
    meta: "1.8 MB • PDF Document",
    exportedAt: "08/04/2026 09:12",
  },
  {
    id: 3,
    fileName: "CV_UX_Designer.pdf",
    meta: "1.8 MB • PDF Document",
    exportedAt: "07/04/2026 18:45",
  },
  {
    id: 4,
    fileName: "CV_Backend_Engineer.pdf",
    meta: "1.2 MB • PDF Document",
    exportedAt: "07/04/2026 14:20",
  },
  {
    id: 5,
    fileName: "CV_Data_Analyst.pdf",
    meta: "2.0 MB • PDF Document",
    exportedAt: "06/04/2026 16:20",
  },
  {
    id: 6,
    fileName: "CV_Marketing_Manager.pdf",
    meta: "1.5 MB • PDF Document",
    exportedAt: "05/04/2026 08:45",
  },
  {
    id: 7,
    fileName: "CV_Java_Developer.pdf",
    meta: "2.1 MB • PDF Document",
    exportedAt: "04/04/2026 13:10",
  },
  {
    id: 8,
    fileName: "CV_Business_Analyst.pdf",
    meta: "1.9 MB • PDF Document",
    exportedAt: "03/04/2026 09:05",
  },
];

const ExportPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  const totalPages = Math.max(1, Math.ceil(exportData.length / perPage));

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return exportData.slice(start, start + perPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className={styles.exportPage}>
      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1>Lịch sử export</h1>
          <p>Theo dõi các file CV đã xuất và trạng thái xử lý.</p>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>TÊN FILE</div>
            <div>THỜI GIAN XUẤT</div>
          </div>

          <div className={styles.tableBody}>
            {currentItems.map((item) => (
              <div className={styles.tableRow} key={item.id}>
                <div className={styles.fileCol}>
                  <div className={styles.fileIcon}>
                    <BsFiletypePdf />
                  </div>

                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{item.fileName}</div>
                    <div className={styles.fileMeta}>{item.meta}</div>
                  </div>
                </div>

                <div className={styles.timeCol}>{item.exportedAt}</div>
              </div>
            ))}

            {currentItems.length === 0 && (
                <div className={styles.emptyState}>
                Chưa có file export nào.
              </div>
            )}
          </div>

          <div className={styles.tableFooter}>
            <div className={styles.footerInfo}>
              Hiển thị <strong>{currentItems.length}</strong> trên{" "}
              <strong>{exportData.length}</strong> file đã xuất
            </div>

            <div className={styles.pagination}>
              <button
                className={styles.pageNav}
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>

              <button
                className={`${styles.pageBtn} ${
                  currentPage === 1 ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>

              <button
                className={`${styles.pageBtn} ${
                  currentPage === 2 ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>

              <button
                className={`${styles.pageBtn} ${
                  currentPage === 3 ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>

              <span className={styles.pageDots}>...</span>
              <button className={styles.pageBtn}>8</button>

              <button
                className={styles.pageNav}
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
