import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { deletePackage } from '~/services/managePackageService';

export function usePackageDelete({ setPackageList, loadPackages }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleOpenDeleteModal = useCallback((item) => {
        setSelectedPackage(item);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (deleting) {
            return;
        }

        setIsDeleteModalOpen(false);
        setSelectedPackage(null);
    }, [deleting]);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedPackage?.id) {
            return;
        }

        setDeleting(true);

        try {
            const response = await deletePackage(selectedPackage.id);

            if (response?.success === false || response?.data?.success === false) {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        'Xóa gói dịch vụ thất bại.'
                );
                return;
            }

            toast.success('Gói dịch vụ đã được xóa khỏi hệ thống.');

            setPackageList((previousState) =>
                previousState.filter(
                    (packageItem) => packageItem.id !== selectedPackage.id
                )
            );

            setIsDeleteModalOpen(false);
            setSelectedPackage(null);
            loadPackages();
        } catch (error) {
            toast.error('Không thể xóa gói dịch vụ.');
        } finally {
            setDeleting(false);
        }
    }, [loadPackages, selectedPackage, setPackageList]);

    return {
        isDeleteModalOpen,
        selectedPackage,
        deleting,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
    };
}