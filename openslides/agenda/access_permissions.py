from ..utils.access_permissions import BaseAccessPermissions
from ..utils.auth import has_perm


class ItemAccessPermissions(BaseAccessPermissions):
    """
    Access permissions container for Item and ItemViewSet.
    """
    def check_permissions(self, user):
        """
        Returns True if the user has read access model instances.
        """
        return has_perm(user, 'agenda.can_see')

    def get_serializer_class(self, user=None):
        """
        Returns serializer class.
        """
        from .serializers import ItemSerializer

        return ItemSerializer

    # TODO: In the following method we use full_data['is_hidden'] but this can be out of date.

    def get_restricted_data(self, full_data, user):
        """
        Returns the restricted serialized data for the instance prepared
        for the user.
        """
        if (has_perm(user, 'agenda.can_see') and
            (not full_data['is_hidden'] or
             has_perm(user, 'agenda.can_see_hidden_items'))):
            if has_perm(user, 'agenda.can_manage'):
                data = full_data
            else:
                # Strip out item comments for unprivileged users.
                data = {}
                for key in full_data.keys():
                    if key != 'comment':
                        data[key] = full_data[key]
        else:
            data = None
        return data

    def get_projector_data(self, full_data):
        """
        Returns the restricted serialized data for the instance prepared
        for the projector. Removes field 'comment'.
        """
        data = {}
        for key in full_data.keys():
            if key != 'comment':
                data[key] = full_data[key]
        return data
