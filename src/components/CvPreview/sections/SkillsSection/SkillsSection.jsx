import React from 'react';
import styles from './SkillsSection.module.scss';

function SkillsSection({ config, data }) {
  const skills = Array.isArray(data) ? data : [];
  const variant = config?.variant || 'progress_bar';

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{config?.title || 'Kỹ năng'}</h2>

      {skills.length === 0 ? (
        <div className={styles.empty}>Chưa có kỹ năng</div>
      ) : variant === 'tag_cloud' ? (
        <div className={styles.tags}>
          {skills.map((skill, index) => (
            <span key={`${skill.name}-${index}`} className={styles.tag}>
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <div className={styles.bars}>
          {skills.map((skill, index) => (
            <div key={`${skill.name}-${index}`} className={styles.barItem}>
              <div className={styles.barTop}>
                <span>{skill.name}</span>
                <span>{skill.level || 0}%</span>
              </div>

              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${skill.level || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SkillsSection;