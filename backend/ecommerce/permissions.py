from rest_framework import permissions # type: ignore

class IsStaffMember(permissions.BasePermission):
    """
    Allows access only to staff members (Artisans/Admins).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
