from rest_framework import permissions

class IsOwnerOrAdminOrNone(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not(request.user.is_authenticated) : 
            return False 
        return request.user.is_admin or obj.student == request.user.studentprofile

    def has_permission(self, request, view):
        if not(request.user.is_authenticated) : 
            return False 
        return request.user.is_admin or request.user.is_authenticated



