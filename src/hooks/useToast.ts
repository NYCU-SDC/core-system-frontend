import { toast } from "sonner"

export const useToast = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  }

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
