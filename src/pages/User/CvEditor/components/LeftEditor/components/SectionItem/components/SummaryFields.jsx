import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import RichTextEditor from '~/components/RichTextEditor';
import { getRewriteProposalsForTarget } from '~/utils/ai-rewrite.utils';

const cx = classNames.bind(styles);

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function AiHint({ proposals = [], onClick }) {
    if (!proposals.length) return null;

    return (
        <button type="button" className={cx('aiFieldHint')} onClick={onClick}>
            <span>AI</span>
            <span>{proposals.length}</span>
        </button>
    );
}

function LabelWithHint({ label, proposals = [], onClick }) {
    return (
        <span className={cx('labelWithHint')}>
            <span>{label}</span>
            <AiHint proposals={proposals} onClick={onClick} />
        </span>
    );
}

function SummaryFields({ data = {}, onChangeField, sectionKey, aiRewrite }) {
    const summaryProposals = getRewriteProposalsForTarget(
        aiRewrite?.proposals,
        {
            sectionKey,
            sectionType: 'summary',
            fieldKey: 'summary',
        },
    );

    const handleHintClick = (event) => {
        event.stopPropagation();
        aiRewrite?.onViewProposal?.(summaryProposals[0]);
    };

    return (
        <FieldGroup
            label={
                <LabelWithHint
                    label="Mục tiêu nghề nghiệp"
                    proposals={summaryProposals}
                    onClick={handleHintClick}
                />
            }
        >
            <RichTextEditor
                value={data.summary || '<p></p>'}
                onChange={(html) => onChangeField?.(sectionKey, 'summary', html)}
                placeholder="Nhập mục tiêu nghề nghiệp..."
                minHeight={180}
            />
        </FieldGroup>
    );
}

export default SummaryFields;
