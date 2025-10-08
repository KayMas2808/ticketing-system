package com.ticketing.system.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketing.system.dto.AssignTicketRequest;
import com.ticketing.system.dto.AttachmentResponse;
import com.ticketing.system.dto.CommentRequest;
import com.ticketing.system.dto.CommentResponse;
import com.ticketing.system.dto.RateTicketRequest;
import com.ticketing.system.dto.TicketRequest;
import com.ticketing.system.dto.TicketResponse;
import com.ticketing.system.dto.UpdateStatusRequest;
import com.ticketing.system.dto.UserResponse;
import com.ticketing.system.entity.Attachment;
import com.ticketing.system.entity.Comment;
import com.ticketing.system.entity.Priority;
import com.ticketing.system.entity.Role;
import com.ticketing.system.entity.Status;
import com.ticketing.system.entity.Ticket;
import com.ticketing.system.entity.User;
import com.ticketing.system.exception.ResourceNotFoundException;
import com.ticketing.system.exception.UnauthorizedException;
import com.ticketing.system.repository.AttachmentRepository;
import com.ticketing.system.repository.CommentRepository;
import com.ticketing.system.repository.TicketRepository;
import com.ticketing.system.repository.UserRepository;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public TicketResponse createTicket(TicketRequest request) {
        User creator = getCurrentUser();

        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        ticket.setStatus(Status.OPEN);
        ticket.setCreator(creator);

        ticket = ticketRepository.save(ticket);
        return convertToResponse(ticket);
    }

    public List<TicketResponse> getAllTickets() {
        User currentUser = getCurrentUser();
        List<Ticket> tickets;

        if (currentUser.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findAll();
        } else if (currentUser.getRole() == Role.SUPPORT_AGENT) {
            tickets = ticketRepository.findByCreatorOrAssignee(currentUser, currentUser);
        } else {
            tickets = ticketRepository.findByCreator(currentUser);
        }

        return tickets.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();
        validateTicketAccess(ticket, currentUser);

        return convertToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicketStatus(Long id, UpdateStatusRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.USER && !ticket.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own tickets");
        }

        ticket.setStatus(request.getStatus());
        ticket = ticketRepository.save(ticket);

        return convertToResponse(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long id, AssignTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.USER) {
            throw new UnauthorizedException("Only admins and support agents can assign tickets");
        }

        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        if (assignee.getRole() != Role.SUPPORT_AGENT && assignee.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Can only assign to support agents or admins");
        }

        ticket.setAsignee(assignee);
        ticket = ticketRepository.save(ticket);

        return convertToResponse(ticket);
    }

    @Transactional
    public TicketResponse rateTicket(Long id, RateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();

        if (!ticket.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only ticket creator can rate the ticket");
        }

        if (ticket.getStatus() != Status.RESOLVED && ticket.getStatus() != Status.CLOSED) {
            throw new UnauthorizedException("Can only rate resolved or closed tickets");
        }

        ticket.setRating(request.getRating());
        ticket.setFeedback(request.getFeedback());
        ticket = ticketRepository.save(ticket);

        return convertToResponse(ticket);
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();
        validateTicketAccess(ticket, currentUser);

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setTicket(ticket);
        comment.setUser(currentUser);

        comment = commentRepository.save(comment);
        return convertToCommentResponse(comment);
    }

    public List<CommentResponse> getTicketComments(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = getCurrentUser();
        validateTicketAccess(ticket, currentUser);

        List<Comment> comments = commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
        return comments.stream().map(this::convertToCommentResponse).collect(Collectors.toList());
    }

    public List<TicketResponse> searchTickets(String query) {
        User currentUser = getCurrentUser();
        List<Ticket> tickets = ticketRepository.findBySubjectContainingIgnoreCase(query);

        return tickets.stream()
                .filter(ticket -> {
                    if (currentUser.getRole() == Role.ADMIN) {
                        return true;
                    } else if (currentUser.getRole() == Role.SUPPORT_AGENT) {
                        return ticket.getCreator().getId().equals(currentUser.getId())
                                || (ticket.getAsignee() != null && ticket.getAsignee().getId().equals(currentUser.getId()));
                    } else {
                        return ticket.getCreator().getId().equals(currentUser.getId());
                    }
                })
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> filterTicketsByStatus(Status status) {
        User currentUser = getCurrentUser();
        List<Ticket> allTickets = ticketRepository.findByStatus(status);

        return allTickets.stream()
                .filter(ticket -> {
                    if (currentUser.getRole() == Role.ADMIN) {
                        return true;
                    } else if (currentUser.getRole() == Role.SUPPORT_AGENT) {
                        return ticket.getCreator().getId().equals(currentUser.getId())
                                || (ticket.getAsignee() != null && ticket.getAsignee().getId().equals(currentUser.getId()));
                    } else {
                        return ticket.getCreator().getId().equals(currentUser.getId());
                    }
                })
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> filterTicketsByPriority(Priority priority) {
        User currentUser = getCurrentUser();
        List<Ticket> allTickets = ticketRepository.findByPriority(priority);

        return allTickets.stream()
                .filter(ticket -> {
                    if (currentUser.getRole() == Role.ADMIN) {
                        return true;
                    } else if (currentUser.getRole() == Role.SUPPORT_AGENT) {
                        return ticket.getCreator().getId().equals(currentUser.getId())
                                || (ticket.getAsignee() != null && ticket.getAsignee().getId().equals(currentUser.getId()));
                    } else {
                        return ticket.getCreator().getId().equals(currentUser.getId());
                    }
                })
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private void validateTicketAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (user.getRole() == Role.SUPPORT_AGENT) {
            if (ticket.getCreator().getId().equals(user.getId())
                    || (ticket.getAsignee() != null && ticket.getAsignee().getId().equals(user.getId()))) {
                return;
            }
        }

        if (user.getRole() == Role.USER && ticket.getCreator().getId().equals(user.getId())) {
            return;
        }

        throw new UnauthorizedException("You don't have access to this ticket");
    }

    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreator(convertToUserResponse(ticket.getCreator()));
        if (ticket.getAsignee() != null) {
            response.setAssignee(convertToUserResponse(ticket.getAsignee()));
        }
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setRating(ticket.getRating());
        response.setFeedback(ticket.getFeedback());

        if (ticket.getComments() != null) {
            response.setComments(ticket.getComments().stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList()));
        }

        if (ticket.getAttachments() != null) {
            response.setAttachments(ticket.getAttachments().stream()
                    .map(this::convertToAttachmentResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        return response;
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setUser(convertToUserResponse(comment.getUser()));
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }

    private AttachmentResponse convertToAttachmentResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());
        response.setUploadedBy(convertToUserResponse(attachment.getUploadedBy()));
        response.setUploadedAt(attachment.getUploadedAt());
        return response;
    }
}
