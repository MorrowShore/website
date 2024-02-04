from django.db import connection

from dpauth.settings import null_group_membership
from dpauth.models import UserVerification
from .models import Community, Membership

def community_membership_extauth(username, group):
    if not group:
        return null_group_membership(username, group)

    try:
        community = Community.objects.get(slug=group)
    except Community.DoesNotExist:
        return None

    try:
        membership = Membership.objects.get(
            community=community,
            user=username.user
        )
    except Membership.DoesNotExist:
        membership = Membership()

    if membership.status == Membership.STATUS_BANNED:
        return None

    if (
        community.require_group_membership and
        not membership.is_member
    ):
        return None

    flags = []

    if (
        membership.is_host or
        community.host_policy == Community.HOST_EVERYONE or
        (
         community.host_policy == Community.HOST_MEMBERS and
         membership.is_member
        )
    ):
        flags.append('HOST')

    if (
        membership.is_trusted or
        (membership.is_member and community.trust_members)
    ):
        flags.append('TRUSTED')

    if membership.is_mod and username.is_mod:
        flags.append('MOD')
        if membership.is_ghost and username.is_ghost:
            flags.append('GHOST')

    try:
        verification = UserVerification.objects.get(pk=username.user_id)
        if verification.exempt_from_bans:
            flags.append('BANEXEMPT')
    except UserVerification.DoesNotExist:
        pass

    return {
        'member': membership.is_member,
        'flags': flags
    }
