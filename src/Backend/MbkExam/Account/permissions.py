from rest_framework import permissions



class IsOwnerOrNone(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not(request.user.is_authenticated) : 
            return False 

        if hasattr(obj,'email'):
            return obj == request.user

        return request.user.is_admin or obj.owner == request.user
    def has_permission(self, request, view):
        if not(request.user.is_authenticated) : 
            return False 
            
        return request.user.is_admin or request.user.is_authenticated
class PostOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.method == 'POST'