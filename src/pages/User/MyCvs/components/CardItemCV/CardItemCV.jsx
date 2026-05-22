import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import { LuFileText } from 'react-icons/lu';
import { IoTimeOutline } from 'react-icons/io5';

import Image from '~/components/Image';
import { config } from '~/config';
import styles from './CardItemCV.module.scss';

const cx = classNames.bind(styles);

function CardItemCV({
    data = {},
    onDelete,
    onRestore,
    onDeleteForever,
    disableLink = false,
}) {
    const isTrashMode =
        typeof onRestore === 'function' || typeof onDeleteForever === 'function';
    const editKey = data?.slug || data?.id || '';
    const editPath = !disableLink && editKey
        ? config.router.editCv.replace(':slug', editKey)
        : '';
    const timeLabel = isTrashMode
        ? `Đã xóa ${data?.deletedAt || ''}`
        : data?.updatedAt;

    const handleDelete = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete?.(data);
    };

    const handleRestore = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onRestore?.(data);
    };

    const handleDeleteForever = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDeleteForever?.(data);
    };

    const previewNode = (
        <div className={cx('previewWrap')}>
            <Image
                src={data?.image}
                alt={data?.name || 'CV preview'}
                className={cx('preview')}
                rounded="none"
                fit="cover"
            />
        </div>
    );

    return (
        <article className={cx('card')}>
            {editPath ? (
                <Link to={editPath} className={cx('previewLink')}>
                    {previewNode}
                </Link>
            ) : (
                previewNode
            )}

            <div className={cx('content')}>
                {editPath ? (
                    <Link to={editPath} className={cx('titleLink')}>
                        <h3 className={cx('cvName')}>{data?.name}</h3>
                    </Link>
                ) : (
                    <h3 className={cx('cvName')}>{data?.name}</h3>
                )}

                <div className={cx('meta')}>
                    {data?.template ? (
                        <span className={cx('metaItem')}>
                            <LuFileText />
                            {data.template}
                        </span>
                    ) : null}

                    <span className={cx('metaItem')}>
                        <IoTimeOutline />
                        {timeLabel}
                    </span>
                </div>

                <div className={cx('bottomRow')}>
                    {isTrashMode ? (
                        <>
                            <button
                                type="button"
                                className={cx('restoreBtn')}
                                onClick={handleRestore}
                            >
                                <FiRotateCcw />
                                <span>Khôi phục</span>
                            </button>

                            <button
                                type="button"
                                className={cx('deleteBtn')}
                                onClick={handleDeleteForever}
                            >
                                <FiTrash2 />
                                <span>Xóa vĩnh viễn</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <span
                                className={cx('statusBadge', {
                                    done: data?.statusCode === 'done',
                                    draft: data?.statusCode === 'draft',
                                })}
                            >
                                {data?.status}
                            </span>

                            {typeof onDelete === 'function' && (
                                <button
                                    type="button"
                                    className={cx('deleteBtn')}
                                    onClick={handleDelete}
                                >
                                    <FiTrash2 />
                                    <span>Xóa</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

export default CardItemCV;